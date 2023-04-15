const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const { exec } = require('child_process');

class Node {
    constructor(start, end, link=-1) {
        this.start = start;
        this.end = end;
        this.link = link;
        this.next = {};
    }

    length() {
        return this.end - this.start;
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
    nodes.push(new Node(-1, -1));
    for (let i = 0; i < s.length; i++) {
        buildTree(i);
    }
}

function saveOutput() {
    let output = JSON.stringify(nodes);
    fs.writeFile('output.txt', output, 'utf-8', (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Output saved to output.txt');
    });
}

function generateVisualization() {
    let graph = 'digraph {node [shape=circle];\n';
    for (let i = 0; i < nodes.length; i++) {
        graph += `${i} [label="${i}: [${nodes[i].start}, ${nodes[i].end}]"];\n`;
        for (let c in nodes[i].next) {
            graph += `${i} -> ${nodes[i].next[c]} [label="${c}"];\n`;
        }
    }
    graph += '}';
    fs.writeFile('output.dot', graph, 'utf-8', (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Graphviz DOT file saved to output.dot');
    });
}
function generateSvg() {
    exec('dot -Tsvg output.dot -o output.svg', (error, stdout, stderr) => {
        if (error) {
            console.error(`dot error: ${error}`);
            return;
        }
        console.log("Suffix tree visualization generated successfully!");
    });
}

let startTime = new Date().getTime();
fs.readFile('input.txt', 'utf-8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    s = data.trim();
    buildSuffixTree();
    saveOutput();
    generateVisualization();
    generateSvg();
    let endTime = new Date().getTime();
    console.log("Input string:", s);
    console.log("Suffix tree built successfully!");
    console.log("Time taken:", (endTime - startTime) / 1000, "seconds");
});
