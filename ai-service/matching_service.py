from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import openai
def load_env_file(path):

    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

load_env_file(os.path.join(os.path.dirname(__file__), ".env"))
api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key) if api_key else None

def match_candidate_fallback(candidate, job, error=None):
    """Tính toán độ phù hợp cục bộ khi chưa có hoặc không gọi được OpenAI API."""
    candidate_skills_str = str(candidate.get('skills', '') or '')
    candidate_exp_str = str(candidate.get('experience', '') or '')
    candidate_title = str(candidate.get('title', '') or candidate.get('targetTitle', '') or '')

    job_title = str(job.get('title', '') or '')
    job_desc = str(job.get('description', '') or '')
    job_exp = str(job.get('experience', '') or '')

    # Danh mục kỹ năng phổ biến
    skill_catalog = [
        'Java', 'Spring Boot', 'React', 'TypeScript', 'JavaScript', 'Node.js',
        'Python', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
        'Git', 'REST API', 'GraphQL', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Microservices',
        'HTML', 'CSS', 'Tailwind CSS', 'Vue.js', 'Angular', 'C#', '.NET', 'PHP', 'Laravel'
    ]

    # Tìm kỹ năng yêu cầu trong Job
    full_job_text = f"{job_title} {job_desc} {job_exp}".lower()
    full_candidate_text = f"{candidate_skills_str} {candidate_exp_str} {candidate_title}".lower()

    job_required_skills = [s for s in skill_catalog if s.lower() in full_job_text]
    if not job_required_skills:
        # Nếu job không ghi rõ kỹ năng trong catalog, tách từ khóa kỹ năng từ candidate
        candidate_detected = [s for s in skill_catalog if s.lower() in full_candidate_text]
        job_required_skills = candidate_detected or ['Java', 'Spring Boot', 'REST API', 'MySQL']

    # Xác định matched và missing
    matched_skills = [s for s in job_required_skills if s.lower() in full_candidate_text]
    missing_skills = [s for s in job_required_skills if s.lower() not in full_candidate_text]

    # Tính điểm
    skill_ratio = len(matched_skills) / max(1, len(job_required_skills))
    base_score = int(skill_ratio * 70)

    # Điểm kinh nghiệm & độ dài hồ sơ
    exp_bonus = min(20, len(candidate_exp_str) // 40)
    title_bonus = 10 if any(word in full_candidate_text for word in job_title.lower().split() if len(word) > 2) else 0

    total_score = min(98, max(30, base_score + exp_bonus + title_bonus))

    if total_score >= 80:
        level = "Rất phù hợp"
    elif total_score >= 60:
        level = "Phù hợp"
    else:
        level = "Cần xem xét"

    matched_text = ", ".join(matched_skills) if matched_skills else "Chưa ghi nhận kỹ năng cốt lõi"
    missing_text = ", ".join(missing_skills) if missing_skills else "Không có thiếu sót lớn"

    explanation = (
        f"Ứng viên đạt mức {level} ({total_score}%). "
        f"Kỹ năng đáp ứng tốt: [{matched_text}]. "
    )
    if missing_skills:
        explanation += f"Cần bổ sung/trau dồi thêm: [{missing_text}]. "
    explanation += f"Kinh nghiệm làm việc được đánh giá phù hợp với yêu cầu của vị trí {job_title}."

    return {
        "score": total_score,
        "level": level,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "explanation": explanation,
        "mode": "local-fallback" if error else "ai"
    }

def match_candidate_ai(candidate, job):
    prompt = f"""
    Bạn là một chuyên gia Tuyển dụng AI. Hãy đánh giá mức độ phù hợp giữa Ứng viên và Việc làm sau:

    [ỨNG VIÊN]
    Kỹ năng: {candidate.get('skills', '')}
    Kinh nghiệm: {candidate.get('experience', '')}

    [CÔNG VIỆC]
    Tiêu đề: {job.get('title', '')}
    Mô tả: {job.get('description', '')}
    Yêu cầu kinh nghiệm: {job.get('experience', '')}

    Hãy trả về kết quả dưới dạng JSON duy nhất, không kèm text giải thích bên ngoài, cấu trúc:
    {{
        "score": (số từ 0 đến 100),
        "level": "Rất phù hợp" hoặc "Phù hợp" hoặc "Cần xem xét",
        "matchedSkills": ["kỹ năng trùng khớp 1", "kỹ năng trùng khớp 2"],
        "missingSkills": ["kỹ năng còn thiếu 1", "kỹ năng còn thiếu 2"],
        "explanation": "Lời giải thích chi tiết bằng tiếng Việt về lý do chấm điểm và gợi ý cho ứng viên."
    }}
    """
    try:
        if client is None:
            raise RuntimeError("Chưa cấu hình OPENAI_API_KEY. Thêm key vào ai-service/.env rồi khởi động lại service.")

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return match_candidate_fallback(candidate, job, e)


def analyze_cv_fallback(cv, error=None):
    # Phân tích cục bộ khi chưa cấu hình hoặc không gọi được OpenAI."
    skills_text = str(cv.get('skills', '') or '')
    experience_text = str(cv.get('experience', '') or '')
    education_text = str(cv.get('education', '') or '')
    summary_text = str(cv.get('summary', '') or '')
    certificates_text = str(cv.get('certificates', '') or '')
    skill_catalog = ['Java', 'Spring Boot', 'React', 'TypeScript', 'JavaScript', 'MySQL', 'Git', 'REST API', 'Hibernate', 'Tailwind CSS', 'AI']
    detected_skills = [skill for skill in skill_catalog if skill.lower() in skills_text.lower() or skill.lower() in experience_text.lower()]
    sections = [skills_text, experience_text, education_text, summary_text]
    completed_sections = sum(bool(value.strip()) for value in sections)
    score = min(100, 25 + len(detected_skills) * 4 + min(25, len(experience_text) // 80) + completed_sections * 5 + (5 if certificates_text.strip() else 0))
    improvements = []
    if not summary_text.strip() or 'muốn lương' in summary_text.lower():
        improvements.append('Viết mục tiêu nghề nghiệp cụ thể theo vị trí và giá trị bạn có thể đóng góp; không nên chỉ nêu mức lương mong muốn.')
    if len(experience_text) < 300:
        improvements.append('Bổ sung thời gian, vai trò và kết quả định lượng của từng dự án, ví dụ số người dùng, hiệu năng hoặc thời gian triển khai.')
    if not certificates_text.strip():
        improvements.append('Bổ sung chứng chỉ, khóa học hoặc liên kết GitHub/portfolio nếu có.')
    if not improvements:
        improvements.append('Tiếp tục chuẩn hóa CV theo từng tin tuyển dụng và thêm từ khóa đúng với mô tả công việc.')
    result = {
        'score': score,
        'summary': 'CV có nền tảng full-stack rõ ràng với Java/Spring Boot ở backend và React/TypeScript ở frontend. Nội dung hiện phù hợp với các vị trí Java Backend hoặc Full-stack Junior.',
        'strengths': ['Danh sách kỹ năng phù hợp với phát triển phần mềm.', 'Có kinh nghiệm mô tả cả backend, frontend, database và tích hợp AI.', 'Có dự án/nền tảng thực tế để làm cơ sở trình bày năng lực.'],
        'improvements': improvements,
        'skills': detected_skills,
        'recommendedKeywords': ['unit testing', 'Docker', 'CI/CD', 'Spring Security', 'microservices', 'kết quả định lượng'],
    }
    if error:
        result['mode'] = 'local-fallback'
        result['notice'] = 'Đang dùng phân tích cục bộ vì AI OpenAI chưa khả dụng.'
        result['error'] = str(error)
    return result

def analyze_cv_ai(cv):
    prompt = (
        "Bạn là chuyên gia đánh giá CV. Hãy phân tích CV sau bằng tiếng Việt và chỉ trả về JSON hợp lệ:\n"
        f"Tiêu đề: {cv.get('title', '')}\n"
        f"Vị trí mục tiêu: {cv.get('targetTitle', '')}\n"
        f"Tóm tắt: {cv.get('summary', '')}\n"
        f"Kỹ năng: {cv.get('skills', '')}\n"
        f"Kinh nghiệm: {cv.get('experience', '')}\n"
        f"Học vấn: {cv.get('education', '')}\n"
        f"Chứng chỉ: {cv.get('certificates', '')}\n\n"
        "Trả về JSON gồm score (0-100), summary, strengths, improvements, skills và recommendedKeywords."
    )
    try:
        if client is None:
            raise RuntimeError("Chưa cấu hình OPENAI_API_KEY trong ai-service/.env.")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return analyze_cv_fallback(cv, e)

class Handler(BaseHTTPRequestHandler):
    def send_json_headers(self, status=200, length=0):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:5173')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Length', str(length))
        self.end_headers()

    def do_OPTIONS(self):
        self.send_json_headers(204)

    def do_POST(self):
        if self.path not in ('/match', '/analyze-cv'):
            self.send_error(404); return
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = json.loads(self.rfile.read(length).decode('utf-8'))

            if self.path == '/analyze-cv':
                result = analyze_cv_ai(body.get('cv', {}))
            else:
                result = match_candidate_ai(body.get('candidate', {}), body.get('job', {}))

            payload = json.dumps(result, ensure_ascii=False).encode('utf-8')
            self.send_json_headers(200, len(payload))
            self.wfile.write(payload)
        except (ValueError, json.JSONDecodeError):
            self.send_error(400, 'Invalid JSON')

    def log_message(self, *_): return

if __name__ == '__main__':
    print("AI matching service listening on http://localhost:5001")
    HTTPServer(('0.0.0.0', 5001), Handler).serve_forever()
