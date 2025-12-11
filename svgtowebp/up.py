import os
import sys
import subprocess
import argparse

def run_cmd(cmd, cwd=None):
    """Git 명령어 실행"""
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"오류: {result.stderr}")
        sys.exit(1)
    print(result.stdout)

def upload_folder(repo_url, folder_path, message):
    """폴더를 GitHub에 업로드"""
    if not os.path.exists(folder_path):
        print(f"폴더 없음: {folder_path}")
        return
    
    # 1. 저장소 클론 (이미 있으면 스킵)
    repo_name = repo_url.split('/')[-1].replace('.git', '')
    if not os.path.exists(repo_name):
        run_cmd(f'git clone {repo_url}')
    
    # 2. 폴더 내용 복사
    target_path = os.path.join(repo_name, os.path.basename(folder_path))
    if os.path.exists(target_path):
        run_cmd(f'rm -rf {target_path}')
    run_cmd(f'cp -r {folder_path} {repo_name}/')
    
    # 3. Git 작업 (repo_name 디렉토리에서)
    os.chdir(repo_name)
    run_cmd('git add .')
    run_cmd(f'git commit -m "{message}"')
    run_cmd('git push origin main')
    print("업로드 완료!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="GitHub에 폴더 업로드")
    parser.add_argument('repo_url', help="GitHub 저장소 URL")
    parser.add_argument('folder_path', help="업로드할 로컬 폴더 경로")
    parser.add_argument('message', help="커밋 메시지")
    args = parser.parse_args()
    
    upload_folder(args.repo_url, args.folder_path, args.message)