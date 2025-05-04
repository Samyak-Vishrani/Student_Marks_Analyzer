from rest_framework import serializers
from .models import Student, Teacher, Subject, Test, Score

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['sapid', 'name', 'roll_no', 'dept_class', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['sapid', 'name', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name']

class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ['id', 'name', 'max_marks', 'subject', 'class_name']

class ScoreSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    test_name = serializers.SerializerMethodField()
    max_marks = serializers.SerializerMethodField()
    
    class Meta:
        model = Score
        fields = ['id', 'test', 'student', 'score', 'is_pass', 'rank', 'student_name', 'test_name', 'max_marks']
        read_only_fields = ['is_pass', 'rank']
    
    def get_student_name(self, obj):
        return obj.student.name
    
    def get_test_name(self, obj):
        return obj.test.name
    
    def get_max_marks(self, obj):
        return obj.test.max_marks

class TestResultSerializer(serializers.ModelSerializer):
    scores = serializers.SerializerMethodField()
    
    class Meta:
        model = Test
        fields = ['id', 'name', 'max_marks', 'subject', 'class_name', 'scores']
    
    def get_scores(self, obj):
        scores = Score.objects.filter(test=obj).order_by('rank')
        return ScoreSerializer(scores, many=True).data

class StudentResultSerializer(serializers.ModelSerializer):
    tests = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = ['sapid', 'name', 'roll_no', 'dept_class', 'tests']
        
    def get_tests(self, obj):
        scores = Score.objects.filter(student=obj).order_by('test__name')
        return ScoreSerializer(scores, many=True).data