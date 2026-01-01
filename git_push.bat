@echo off
echo Starting Git Operations > git_log.txt
echo Checking Status >> git_log.txt
git status >> git_log.txt 2>&1
echo. >> git_log.txt
echo Switching to secondreview >> git_log.txt
git checkout -B secondreview >> git_log.txt 2>&1
echo. >> git_log.txt
echo Adding files >> git_log.txt
git add . >> git_log.txt 2>&1
echo. >> git_log.txt
echo Committing >> git_log.txt
git commit -m "Final submission for second review" >> git_log.txt 2>&1
echo. >> git_log.txt
echo Pushing... >> git_log.txt
git push -u origin secondreview >> git_log.txt 2>&1
echo Done >> git_log.txt
