export type UserRole = "admin" | "teacher" | "student" | "parent";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      classes: {
        Row: {
          id: string;
          name: string;
          grade: string;
          section: string;
          academic_year: string;
          teacher_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["classes"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>;
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          name_ar: string;
          description: string | null;
          class_id: string;
          teacher_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["subjects"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["subjects"]["Insert"]>;
      };
      students: {
        Row: {
          id: string;
          user_id: string;
          class_id: string;
          student_number: string;
          date_of_birth: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["students"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
      };
      teachers: {
        Row: {
          id: string;
          user_id: string;
          specialization: string | null;
          hire_date: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["teachers"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["teachers"]["Insert"]>;
      };
      parents: {
        Row: {
          id: string;
          user_id: string;
          relationship: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["parents"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["parents"]["Insert"]>;
      };
      parent_students: {
        Row: {
          id: string;
          parent_id: string;
          student_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["parent_students"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["parent_students"]["Insert"]>;
      };
      lessons: {
        Row: {
          id: string;
          title: string;
          content: string | null;
          subject_id: string;
          teacher_id: string;
          class_id: string;
          order_index: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lessons"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["lessons"]["Insert"]>;
      };
      lesson_files: {
        Row: {
          id: string;
          lesson_id: string;
          file_url: string;
          file_name: string;
          file_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lesson_files"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["lesson_files"]["Insert"]>;
      };
      homework: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          subject_id: string;
          teacher_id: string;
          class_id: string;
          due_date: string;
          max_grade: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["homework"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["homework"]["Insert"]>;
      };
      homework_submissions: {
        Row: {
          id: string;
          homework_id: string;
          student_id: string;
          file_url: string | null;
          text_answer: string | null;
          grade: number | null;
          feedback: string | null;
          submitted_at: string;
          graded_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["homework_submissions"]["Row"], "submitted_at">;
        Update: Partial<Database["public"]["Tables"]["homework_submissions"]["Insert"]>;
      };
      exams: {
        Row: {
          id: string;
          title: string;
          subject_id: string;
          teacher_id: string;
          class_id: string;
          duration_minutes: number;
          start_time: string | null;
          end_time: string | null;
          max_grade: number;
          is_published: boolean;
          instructions: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["exams"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["exams"]["Insert"]>;
      };
      questions: {
        Row: {
          id: string;
          exam_id: string | null;
          bank_id: string | null;
          question_text: string;
          question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
          image_url: string | null;
          pdf_url: string | null;
          points: number;
          order_index: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["questions"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["questions"]["Insert"]>;
      };
      options: {
        Row: {
          id: string;
          question_id: string;
          option_text: string;
          is_correct: boolean;
          order_index: number;
        };
        Insert: Database["public"]["Tables"]["options"]["Row"];
        Update: Partial<Database["public"]["Tables"]["options"]["Insert"]>;
      };
      answers: {
        Row: {
          id: string;
          exam_result_id: string;
          question_id: string;
          selected_option_id: string | null;
          text_answer: string | null;
          is_correct: boolean | null;
          points_earned: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["answers"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["answers"]["Insert"]>;
      };
      exam_results: {
        Row: {
          id: string;
          exam_id: string;
          student_id: string;
          total_grade: number;
          percentage: number;
          started_at: string;
          submitted_at: string | null;
          status: "in_progress" | "submitted" | "graded";
        };
        Insert: Omit<Database["public"]["Tables"]["exam_results"]["Row"], "started_at">;
        Update: Partial<Database["public"]["Tables"]["exam_results"]["Insert"]>;
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          date: string;
          status: "present" | "absent" | "late" | "excused";
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["attendance"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["attendance"]["Insert"]>;
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          target_roles: UserRole[];
          class_id: string | null;
          is_pinned: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["announcements"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["announcements"]["Insert"]>;
      };
      question_bank: {
        Row: {
          id: string;
          teacher_id: string;
          subject_id: string;
          title: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["question_bank"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["question_bank"]["Insert"]>;
      };
      schedules: {
        Row: {
          id: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          room: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["schedules"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["schedules"]["Insert"]>;
      };
    };
  };
};

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type User = Tables<"users">;
export type Class = Tables<"classes">;
export type Subject = Tables<"subjects">;
export type Student = Tables<"students">;
export type Teacher = Tables<"teachers">;
export type Parent = Tables<"parents">;
export type Lesson = Tables<"lessons">;
export type LessonFile = Tables<"lesson_files">;
export type Homework = Tables<"homework">;
export type HomeworkSubmission = Tables<"homework_submissions">;
export type Exam = Tables<"exams">;
export type Question = Tables<"questions">;
export type Option = Tables<"options">;
export type Answer = Tables<"answers">;
export type ExamResult = Tables<"exam_results">;
export type Attendance = Tables<"attendance">;
export type Announcement = Tables<"announcements">;
export type QuestionBank = Tables<"question_bank">;
export type Schedule = Tables<"schedules">;
