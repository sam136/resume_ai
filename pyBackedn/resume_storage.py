import json
import os

class ResumeStorage:
    def __init__(self, file_path):
        self.file_path = file_path
        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w') as f:
                json.dump({}, f)

    def _read_data(self):
        with open(self.file_path, 'r') as f:
            return json.load(f)

    def _write_data(self, data):
        with open(self.file_path, 'w') as f:
            json.dump(data, f, indent=4)

    def get_resume(self, resume_id):
        data = self._read_data()
        return data.get(str(resume_id))

    def get_all_resumes(self):
        return [{'resumeId': k, 'responseDict': v} for k, v in self._read_data().items()]

    def add_resume(self, resume_id, resume_data):
        data = self._read_data()
        data[str(resume_id)] = resume_data
        self._write_data(data)

    def update_resume(self, resume_id, updated_data):
        data = self._read_data()
        if str(resume_id) in data:
            data[str(resume_id)].update(updated_data)
            self._write_data(data)
            return True
        return False

    def delete_resume(self, resume_id):
        data = self._read_data()
        if str(resume_id) in data:
            del data[str(resume_id)]
            self._write_data(data)
            return True
        return False

    def generate_new_id(self):
        data = self._read_data()
        return max(map(int, data.keys()), default=0) + 1
