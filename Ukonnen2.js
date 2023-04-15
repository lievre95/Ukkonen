const path = require('path');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const { exec } = require('child_process');

class Node {
    constructor(start, end, link = -1) {
        this.start = start;
        this.end = end;
        this.link = link;
        this.next = {};
    }

    length() {
        return this.end - this.start;
    }

    get label() {
        return s.substring(this.start, this.end);
    }

    get id() {
        return `n${this.start}_${this.end}`;
    }

    get attributes() {
        if (this.start === 0 && this.end === 0) {
            // root node
            return `[label="root", style=invis]`;
        } else {
            return `[label="${this.label.replace(/"/g, '\\"')}"]`;
        }
    }
}

let nodes = [];
let s;
let root = nodes.length;
let last = root;

function buildTree(pos) {
    let cur = nodes.length;
    nodes.push(new Node(pos, s.length));
    let p = last;
    while (p !== -1 && !(s[pos] in nodes[p].next)) {
        nodes[p].next[s[pos]] = cur;
        p = nodes[p].link;
    }
    if (p === -1) {
        nodes[cur].link = root;
    } else {
        let q = nodes[p].next[s[pos]];
        if (nodes[p].length() + 1 === nodes[q].length()) {
            nodes[cur].link = q;
        } else {
            let clone = nodes.length;
            nodes.push(new Node(nodes[q].start, nodes[p].start + nodes[q].length(), nodes[q].link));
            nodes[q].link = nodes[cur].link = clone;
            while (p !== -1 && s[pos] in nodes[p].next && nodes[p].next[s[pos]] === q) {
                nodes[p].next[s[pos]] = clone;
                p = nodes[p].link;
            }
        }
    }
    last = cur;
    return cur;
}

function buildSuffixTree() {
    root = last = nodes.length;
    nodes.push(new Node(0, 0));
    for (let i = 0; i < s.length; i++) {
        buildTree(i);
    }
}

function generateDot() {
    let dot = `digraph {
  node [shape=circle];
  edge [arrowhead=vee];
  n0_0 [label="", style=invis];
${nodes.map(node => `  ${node.id} ${node.attributes};\n`).join('')}
${nodes.map(node => Object.entries(node.next).map(([c, id]) => `  ${node.id} -> n${nodes[id].start}_${nodes[id].end} [label="${c.replace(/"/g, '\\"')}" ];\n`).join('')).join('')}
}`;
    fs.writeFileSync('suffix-tree.dot', dot);
}

function generateSvg() {
    exec('dot -Tsvg suffix-tree.dot -o suffix-tree.svg', (error, stdout, stderr) => {
        if (error) {
            console.error(`dot error: ${error}`);
            return;
        }
        console.log("Suffix tree visualization generated successfully!");
    });
    setTimeout(() => {
        console.log("SVG generation complete");
    }, 5000); // 5 second delay
}


const startTime = new Date().getTime();
fs.readFile('input.txt', 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    s = data.trim();
    console.log("Input string:", s);
    buildSuffixTree();
    generateDot();
    generateSvg();
    const endTime = new Date().getTime();
    console.log("Time taken:", (endTime - startTime) / 1000, "seconds");
});