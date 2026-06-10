const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\user\\OneDrive\\Desktop\\portfolio\\src\\pages\\AdminPage.jsx', 'utf8');
const lines = content.split('\n');

let stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const tags = line.match(/<(div|motion\.div|section|aside|header|footer|nav|ul|li|button|main|form|table|thead|tbody|tr|th|td|h1|h2|h3|h4|h5|h6|p|span|a|label|select|option|textarea|AnimatePresence|AnimatePresence mode="wait"|AnimatePresence mode='wait'|AnimatePresence mode="popLayout"|AnimatePresence mode='popLayout')( [^>]*)?>/g) || [];
  const closingTags = line.match(/<\/(div|motion\.div|section|aside|header|footer|nav|ul|li|button|main|form|table|thead|tbody|tr|th|td|h1|h2|h3|h4|h5|h6|p|span|a|label|select|option|textarea|AnimatePresence)>/g) || [];

  tags.forEach(t => {
    if (!t.includes('/>')) {
      const tagName = t.match(/<([a-zA-Z0-9.-]+)/)[1];
      stack.push({ tag: tagName, line: i + 1 });
    }
  });

  closingTags.forEach(t => {
    const tagName = t.match(/<\/([a-zA-Z0-9.-]+)/)[1];
    if (stack.length > 0) {
      const last = stack.pop();
      if (last.tag !== tagName) {
        console.log(`Mismatch at line ${i + 1}: expected </${last.tag}> (opened at line ${last.line}), got </${tagName}>`);
      }
    } else {
      console.log(`Extra closing tag </${tagName}> at line ${i + 1}`);
    }
  });
}

if (stack.length > 0) {
  console.log('Unclosed tags:');
  stack.forEach(s => console.log(`${s.tag} opened at line ${s.line}`));
}
