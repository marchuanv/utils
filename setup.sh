results=$(git status | grep "nothing to commit")
if [ ! -z "$results" -a "$results" != " " ]; then
	echo "nothing has changed moving on..."
else
	reset
	git pull origin master
	git add -A
	git commit -m "fix"
	git push origin master
	git clean -fdx
	npm install
	npm update
fi