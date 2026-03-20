import csv
import json
import os

questions = []
file_path = 'GuidelineQuiz.csv'
out_path = 'questions.js'

try:
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not row or not row.get('問題文'):
                continue
            
            # Make sure to handle empty or malformed '正解番号' gracefully
            try:
                ans = int(row.get('正解番号', 1))
            except ValueError:
                ans = 1
                
            q = {
                'source': row.get('出典', '').strip(),
                'question': row.get('問題文', '').strip(),
                'choices': [
                    row.get('選択肢1', '').strip(),
                    row.get('選択肢2', '').strip(),
                    row.get('選択肢3', '').strip(),
                    row.get('選択肢4', '').strip()
                ],
                'answer': ans,
                'explanation': row.get('解説', '').strip()
            }
            questions.append(q)

    js_content = "const quizData = " + json.dumps(questions, ensure_ascii=False, indent=4) + ";\n"
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"questions.js generated successfully with {len(questions)} questions.")

except Exception as e:
    import traceback
    traceback.print_exc()
