cd /Users/jonathanold/Documents/GitHub/jonathanold.github.io/
rm -rf docs || exit 0
hugo
mv public docs
 
 git remote remove origin
 git remote add origin https://github.com/jonathanold/jonathanold.github.io.git
git commit -m "Test"

 git push -u origin master