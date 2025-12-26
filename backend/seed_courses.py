"""
Seed script to populate the database with courses and lessons
Run this script once to initialize the courses and lessons in the database
"""

import sys
sys.path.append(r"/Users/hungcucu/Documents/vsl_web_new/backend/modules")

from modules.database import SessionLocal
from modules.create_table import Course, Lesson

def seed_courses():
    db = SessionLocal()
    
    try:
        # Check if courses already exist
        existing_courses = db.query(Course).count()
        if existing_courses > 0:
            print(f"Database already has {existing_courses} courses. Skipping seed.")
            return
        
        print("Seeding courses and lessons...")
        
        # 1. Vietnamese Alphabet Course
        alphabet_course = Course(
            id="alphabet",
            name="Vietnamese Alphabet",
            level="BEGINNER",
            description="Learn Vietnamese hand signs for each letter A-Z",
            lesson_type="letter"
        )
        db.add(alphabet_course)
        db.flush()
        
        # Alphabet lessons (22 letters we have)
        alphabet_letters = [
            ("a", "A", "https://eflvwplvmzlychlhuzsf.supabase.co/storage/v1/object/public/vsl_videos/alphabet/a.jpg"),
            ("b", "B", "https://eflvwplvmzlychlhuzsf.supabase.co/storage/v1/object/public/vsl_videos/videos/images.jfif"),
            ("c", "C", "https://eflvwplvmzlychlhuzsf.supabase.co/storage/v1/object/public/vsl_videos/alphabet/C.webp"),
            ("d", "D", "https://placeholder.svg?height=400&width=600&query=sign-language-d"),
            ("e", "E", "https://placeholder.svg?height=400&width=600&query=sign-language-e"),
            ("g", "G", "https://placeholder.svg?height=400&width=600&query=sign-language-g"),
            ("h", "H", "https://placeholder.svg?height=400&width=600&query=sign-language-h"),
            ("i", "I", "https://placeholder.svg?height=400&width=600&query=sign-language-i"),
            ("k", "K", "https://placeholder.svg?height=400&width=600&query=sign-language-k"),
            ("l", "L", "https://placeholder.svg?height=400&width=600&query=sign-language-l"),
            ("m", "M", "https://placeholder.svg?height=400&width=600&query=sign-language-m"),
            ("n", "N", "https://placeholder.svg?height=400&width=600&query=sign-language-n"),
            ("o", "O", "https://placeholder.svg?height=400&width=600&query=sign-language-o"),
            ("p", "P", "https://placeholder.svg?height=400&width=600&query=sign-language-p"),
            ("q", "Q", "https://placeholder.svg?height=400&width=600&query=sign-language-q"),
            ("r", "R", "https://placeholder.svg?height=400&width=600&query=sign-language-r"),
            ("s", "S", "https://placeholder.svg?height=400&width=600&query=sign-language-s"),
            ("t", "T", "https://placeholder.svg?height=400&width=600&query=sign-language-t"),
            ("u", "U", "https://placeholder.svg?height=400&width=600&query=sign-language-u"),
            ("v", "V", "https://placeholder.svg?height=400&width=600&query=sign-language-v"),
            ("x", "X", "https://placeholder.svg?height=400&width=600&query=sign-language-x"),
            ("y", "Y", "https://placeholder.svg?height=400&width=600&query=sign-language-y"),
        ]
        
        for idx, (lesson_id, name, video_url) in enumerate(alphabet_letters):
            lesson = Lesson(
                lesson_id=lesson_id,
                name=name,
                course_id="alphabet",
                video_url=video_url,
                order=idx
            )
            db.add(lesson)
        
        # 2. Greetings Course
        greetings_course = Course(
            id="greetings",
            name="Greeting & Basic Conversation",
            level="BEGINNER",
            description="Master essential greetings and conversational phrases",
            lesson_type="word"
        )
        db.add(greetings_course)
        db.flush()
        
        greetings_lessons = [
            ("xin_chao", "Xin chào", "https://placeholder.svg?height=400&width=600&query=sign-language-hello"),
            ("goodbye", "Goodbye", "https://placeholder.svg?height=400&width=600&query=sign-language-goodbye"),
            ("thankyou", "Thank You", "https://placeholder.svg?height=400&width=600&query=sign-language-thank-you"),
            ("please", "Please", "https://placeholder.svg?height=400&width=600&query=sign-language-please"),
            ("yes", "Yes", "https://placeholder.svg?height=400&width=600&query=sign-language-yes"),
            ("no", "No", "https://placeholder.svg?height=400&width=600&query=sign-language-no"),
        ]
        
        for idx, (lesson_id, name, video_url) in enumerate(greetings_lessons):
            lesson = Lesson(
                lesson_id=lesson_id,
                name=name,
                course_id="greetings",
                video_url=video_url,
                order=idx
            )
            db.add(lesson)
        
        # 3. Basic Verbs Course
        verbs_course = Course(
            id="verbs",
            name="Basic Verbs",
            level="BEGINNER",
            description="Learn common action signs and verbs",
            lesson_type="word"
        )
        db.add(verbs_course)
        db.flush()
        
        verbs_lessons = [
            ("go", "Go", "https://placeholder.svg?height=400&width=600&query=sign-language-go"),
            ("come", "Come", "https://placeholder.svg?height=400&width=600&query=sign-language-come"),
            ("eat", "Eat", "https://placeholder.svg?height=400&width=600&query=sign-language-eat"),
            ("sleep", "Sleep", "https://placeholder.svg?height=400&width=600&query=sign-language-sleep"),
            ("work", "Work", "https://placeholder.svg?height=400&width=600&query=sign-language-work"),
            ("play", "Play", "https://placeholder.svg?height=400&width=600&query=sign-language-play"),
        ]
        
        for idx, (lesson_id, name, video_url) in enumerate(verbs_lessons):
            lesson = Lesson(
                lesson_id=lesson_id,
                name=name,
                course_id="verbs",
                video_url=video_url,
                order=idx
            )
            db.add(lesson)
        
        # 4. Common Nouns Course
        nouns_course = Course(
            id="nouns",
            name="Common Nouns",
            level="INTERMEDIATE",
            description="Essential words for everyday objects and people",
            lesson_type="word"
        )
        db.add(nouns_course)
        db.flush()
        
        nouns_lessons = [
            ("family", "Family", "https://placeholder.svg?height=400&width=600&query=sign-language-family"),
            ("food", "Food", "https://placeholder.svg?height=400&width=600&query=sign-language-food"),
            ("house", "House", "https://placeholder.svg?height=400&width=600&query=sign-language-house"),
            ("school", "School", "https://placeholder.svg?height=400&width=600&query=sign-language-school"),
            ("work", "Work", "https://placeholder.svg?height=400&width=600&query=sign-language-work"),
            ("friend", "Friend", "https://placeholder.svg?height=400&width=600&query=sign-language-friend"),
        ]
        
        for idx, (lesson_id, name, video_url) in enumerate(nouns_lessons):
            lesson = Lesson(
                lesson_id=lesson_id,
                name=name,
                course_id="nouns",
                video_url=video_url,
                order=idx
            )
            db.add(lesson)
        
        # Commit all changes
        db.commit()
        
        print("✅ Successfully seeded database with 4 courses and 46 lessons!")
        print("\nCourses created:")
        print("  - Vietnamese Alphabet (22 lessons)")
        print("  - Greeting & Basic Conversation (6 lessons)")
        print("  - Basic Verbs (6 lessons)")
        print("  - Common Nouns (6 lessons)")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Starting database seed...")
    seed_courses()
    print("🎉 Seed complete!")

