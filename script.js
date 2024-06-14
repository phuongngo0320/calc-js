const btnAC = document.querySelector('#ac');
const btnPar = document.querySelector('#par');
const btnPercent = document.querySelector('#per');
const btnBack = document.querySelector('#backspace');

const btn0 = document.querySelector('#_0');
const btn1 = document.querySelector('#_1');
const btn2 = document.querySelector('#_2');
const btn3 = document.querySelector('#_3');
const btn4 = document.querySelector('#_4');
const btn5 = document.querySelector('#_5');
const btn6 = document.querySelector('#_6');
const btn7 = document.querySelector('#_7');
const btn8 = document.querySelector('#_8');
const btn9 = document.querySelector('#_9');

const btnAdd = document.querySelector('#add');
const btnSub = document.querySelector('#sub');
const btnMul = document.querySelector('#mul');
const btnDiv = document.querySelector('#div');
const btnEq = document.querySelector('#eq');
const btnSign = document.querySelector('#tgl');
const btnDot = document.querySelector('#dot');

const NUMBER_BUTTONS = [btn0, btn1, btn2, btn3, btn4, btn5, btn6, btn7, btn8, btn9];
const OPERATOR_BUTTONS = [btnAdd, btnSub, btnMul, btnDiv];
const ALL_BUTTONS = [
    btnAC, btnPar, btnPercent, btnBack, 
    ...NUMBER_BUTTONS, 
    ...OPERATOR_BUTTONS, 
    btnSign, btnDot, btnEq
];

const input = document.querySelector("#input");
const output = document.querySelector("#output");

let expression = "";
let buffer = "";
let operandStack = [""];
let parStack = [];

const currentOperand = () => operandStack[operandStack.length - 1];
const setCurrentOperand = (value) => operandStack[operandStack.length - 1] = value;
const lastParenthesis = () => parStack.length > 0 ? parStack[parStack.length - 1] : "";
const pushParenthesis = (par) => {
    if (parStack.length === 0) {
        if (par === ")") {
            throw new Error("Invalid parentheses stack operand");
        } else {
            parStack.push(par);
        }
    } else {
        if (lastParenthesis() === ")") {
            throw new Error("Invalid parentheses stack operand");
        } else {
            parStack.pop();
        }
    }
}

setInput();
output.style.visibility = "hidden";

function formatOperand(op) {
    let formatted;
    if (op.includes(".")) {
        const [int, dec] = op.split(".");
        formatted = parseFloat(int).toLocaleString('en') + "." + dec;
    } else {
        formatted = parseFloat(op).toLocaleString('en');
    }
    return formatted;
}

function setInput() {

    enable();

    if (buffer.length === 0 && currentOperand().length === 0) {
        input.textContent = "Type something...";
        input.style.fontSize = "2rem";
        disable([...OPERATOR_BUTTONS, btnEq, btnBack, btnDot, btnPercent]);
    } else {

        if (buffer[buffer.length - 1] === "%") {
            disable([...NUMBER_BUTTONS, btnDot, btnPercent, btnSign]);
        } else if (buffer[buffer.length - 1] === "(" && currentOperand().length === 0) {
            disable([btnMul, btnDiv, btnPercent, btnDot, btnSign]);
        } else if (buffer[buffer.length - 1] === ")" && currentOperand().length === 0) {
            disable([btnPercent, btnSign, btnDot]);
        } else if (currentOperand().length === 0) {
            disable([btnPercent, btnDot]);
        }

        console.log(buffer, currentOperand());

        input.textContent = buffer + (currentOperand().length === 0 ? "" : formatOperand(currentOperand()));
        if (input.textContent.length <= 8) {
            input.style.fontSize = "4rem";
        } else if (input.textContent.length <= 15) {
            input.style.fontSize = "3rem";
        } else if (input.textContent.length <= 23) {
            input.style.fontSize = "2rem";
        } else {
            input.style.fontSize = "1rem";
        }
    }
}

function setOutput(hide = false) {
    
    console.log("exp", expression);
    let res;
    try {
        res = expression.length === 0 ? NaN : Function(`'use strict'; return (${expression.replace("--", "+")})`)();
    } catch(error) {
        if (error) {
            console.log("There is an error!", expression);
            disable([btnEq]);
        }
    } finally {

        if (hide) {
            output.style.visibility = "hidden";
            buffer = "";
            setCurrentOperand(res.toString());
            expression = res.toString();
            setInput();
        } else {
            if (isNaN(res)) {
                output.style.visibility = "hidden";
            } else {
                output.style.visibility = "visible";
                res = res.toLocaleString('en');
                output.textContent = res;
                if (res.length <= 8) {
                    output.style.fontSize = "4rem";
                } else if (res.length <= 15) {
                    output.style.fontSize = "3rem";
                } else if (res.length <= 23) {
                    output.style.fontSize = "2rem";
                } else {
                    output.style.fontSize = "1rem";
                }
            }
        }
    }
}

function append(token, view = null) {
    if (isNaN(parseFloat(token)) && token !== ".") { // operators

        // operator replacement for +, -, *, /
        if (currentOperand().length === 0 && 
            buffer[buffer.length - 1] !== "%" &&
            buffer[buffer.length - 1] !== ")" &&
            buffer[buffer.length - 1] !== "(" &&
            token !== "/100"
        ) { 
            buffer = buffer.substring(0, buffer.length - 1) + (view ?? token);
        } else {

            if (buffer.endsWith("%")) {
                buffer += (view ?? token);
                operandStack.push("");
            } else if ((buffer.endsWith(")") || buffer.endsWith("(")) && currentOperand().length === 0) {
                buffer += (view ?? token);
            } else {
                buffer += formatOperand(currentOperand()) + (view ?? token);
                operandStack.push("");
            }
        }
    } else { // numbers
        if (buffer.endsWith(")")) {
            // add extra multiply sign for )<num>
            append("*", "×");
        }
        setCurrentOperand(currentOperand() + token);
        console.log(currentOperand(), "current");
    }

    expression += token;
    setInput();
    setOutput();
}

function parenthesize() {
    if (currentOperand() === "") {
        if (buffer.endsWith(")")) {
            // add extra multiply sign for )(
            append("*", "×");
        }
        pushParenthesis("(");
        expression = expression.concat("(");
        buffer = buffer.concat("(");
    } else {
        console.log("last", lastParenthesis());
        if (lastParenthesis() === "") {
            append("*", "×"); // extra multiply sign
            pushParenthesis("(");
            expression = expression.concat("(");
            buffer = buffer.concat("(");
        } else {
            pushParenthesis(")");
            expression = expression.concat(")");
            buffer = buffer.concat(parseFloat(currentOperand()).toLocaleString('en')).concat(")");
            operandStack.push("");
        }
    }

    setInput();
    setOutput();
}

function toggle() {

    startIndex = expression.length - 1;
    while (startIndex > 0 && !isNaN(expression[startIndex])) {
        startIndex--;
        if (expression[startIndex] === ".") {
            startIndex--;
        }
    }

    if (currentOperand().startsWith("-")) {
        // to plus
        setCurrentOperand(currentOperand().substring(1, currentOperand().length));
        expression = expression.substring(0, startIndex).concat(expression.substring(startIndex + 1, expression.length));
    } else {
        setCurrentOperand("-".concat(currentOperand()));
        expression = expression.substring(0, startIndex).concat("-").concat(expression.substring(startIndex, expression.length));
    }

    setInput();
    setOutput();
}

function backspace() {
    if (buffer.endsWith("%")) {
        expression = expression.substring(0, expression.length - 4); // remove /100
    } else {
        expression = expression.substring(0, expression.length - 1);
    }

    if (currentOperand().length > 0) {
        setCurrentOperand(currentOperand().substring(0, currentOperand().length - 1));
    } else {
        buffer = buffer.substring(0, buffer.length - 1);
        if (currentOperand().length === 0 && !isNaN(buffer[buffer.length - 1])) {
            // reach an operand
            operandStack.pop();
            while (!isNaN(buffer[buffer.length - 1])) {
                buffer = buffer.substring(0, buffer.length - 1);
            }
        }
    }
    
    setInput();
    setOutput();
}

function enable(buttons = ALL_BUTTONS) {
    buttons.forEach(button => {
        button.style.pointerEvents = "auto"
        button.style.opacity = 1;
    });
}

function disable(buttons = ALL_BUTTONS) {
    buttons.forEach(button => {
        button.style.pointerEvents = "none";
        button.style.opacity = 0.5;
    });
}

function reset() {
    expression = "";
    buffer = "";
    operandStack = [""];
    parStack = [];
    setInput();
    setOutput();
}

btn0.addEventListener('click', () => append('0'));
btn1.addEventListener('click', () => append('1'));
btn2.addEventListener('click', () => append('2'));
btn3.addEventListener('click', () => append('3'));
btn4.addEventListener('click', () => append('4'));
btn5.addEventListener('click', () => append('5'));
btn6.addEventListener('click', () => append('6'));
btn7.addEventListener('click', () => append('7'));
btn8.addEventListener('click', () => append('8'));
btn9.addEventListener('click', () => append('9'));

btnAdd.addEventListener('click', () => append('+'));
btnSub.addEventListener('click', () => append('-'));
btnMul.addEventListener('click', () => append('*', '×'));
btnDiv.addEventListener('click', () => append('/', '÷'));
btnPercent.addEventListener('click', () => append('/100', '%'));
btnDot.addEventListener('click', () => append("."));
btnPar.addEventListener('click', () => parenthesize());
btnSign.addEventListener('click', () => toggle());

btnAC.addEventListener('click', () => reset());
btnEq.addEventListener('click', () => setOutput(true));
btnBack.addEventListener('click', () => backspace());