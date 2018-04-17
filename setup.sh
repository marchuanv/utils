reset
sudo fuser -k 3002/tcp
sudo fuser -k 3002/tcp
sudo fuser -k 3002/tcp
export PORT
PORT=3002

export libraryregisters
libraryregisters='http://localhost:3000/registers'

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
echo ""
echo "////////////////////////	HOSTING TIMER LIBRARY	////////////////////////"
(nohup npm start /dev/null 2>&1 &)
echo ""
