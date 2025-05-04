from django.db import models

class Student(models.Model):
    sapid = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=20)
    dept_class = models.CharField(max_length=50)
    password = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.sapid})"

class Teacher(models.Model):
    sapid = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.sapid})"

class Subject(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Test(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    # max_marks = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks = models.IntegerField(null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    class_name = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.name} - {self.subject.name}"

class Score(models.Model):
    id = models.AutoField(primary_key=True)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    is_pass = models.BooleanField(default=False)
    rank = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ('test', 'student')

    def __str__(self):
        return f"{self.student.name} - {self.test.name}: {self.score}"

    def save(self, *args, **kwargs):
        # Check if the student passed the test
        if self.score >= (self.test.max_marks * 0.4):  # Assuming 40% is pass
            self.is_pass = True
        else:
            self.is_pass = False
        
        super().save(*args, **kwargs)
        
        # Update ranks for all students in this test
        self.update_ranks()
    
    def update_ranks(self):
        # Get all scores for this test ordered by score (descending)
        scores = Score.objects.filter(test=self.test).order_by('-score')
        
        # Update rank for each score
        for rank, score in enumerate(scores, 1):
            if score.rank != rank:
                score.rank = rank
                Score.objects.filter(id=score.id).update(rank=rank)