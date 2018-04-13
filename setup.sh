reset
sudo fuser -k 3333/tcp
export PORT
PORT=3333
cd ./../libraryhost/
./setup.sh
cd ./../utils/
results=$(git status | grep "nothing to commit")
if [ ! -z "$results" -a "$results" != " " ]; then
	echo "nothing has changed moving on..."
else
	git pull origin master
	git add -A
	git commit -m "fix"
	git push origin master
fi
npm update
reset
npm start