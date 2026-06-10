const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\OneDrive\\Desktop\\portfolio\\src\\pages\\AdminPage.jsx', 'utf8');

function count(str, char) {
  return (str.match(new RegExp(char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g')) || []).length;
}

console.log('Braces {}:', count(content, '{'), count(content, '}'));
console.log('Brackets []:', count(content, '['), count(content, ']'));
console.log('Parentheses ():', count(content, '('), count(content, ')'));

const tags = content.match(/<[a-zA-Z0-9.-]+/g) || [];
const closingTags = content.match(/<\/[a-zA-Z0-9.-]+/g) || [];

console.log('Tags < >:', tags.length, closingTags.length);

const motionDivs = content.match(/<motion.div/g) || [];
const closingMotionDivs = content.match(/<\/motion.div/g) || [];
console.log('motion.div:', motionDivs.length, closingMotionDivs.length);

const divs = content.match(/<div/g) || [];
const closingDivs = content.match(/<\/div/g) || [];
console.log('div:', divs.length, closingDivs.length);
