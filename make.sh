cd /Users/jonathanold/Documents/GitHub/jonathanold.github.io/
rm -rf docs || exit 0
hugo
mv public docs
 
 git remote remove origin
 git remote add origin git@github.com:jonathanold/jonathanold.github.io.git

 git add .
git commit -m "Added new favicon"

 git push -u origin source

