from dataclasses import dataclass, asdict


@dataclass
class StudentProfile:
    roll_number: str = ""
    full_name: str = ""
    email: str = ""
    department_name: str = ""
    section: str = ""
    student_id: str = ""

    def to_dict(self):
        return asdict(self)
