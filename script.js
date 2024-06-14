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
const currentOperand = () => operandStack[operandStack.length - 1];
const setCurrentOperand = (value) => operandStack[operandStack.length - 1] = value;

setInput();
output.style.visibility = "hidden";

function setInput() {

    enable();

    if (buffer.length === 0 && currentOperand().length === 0) {
        input.textContent = "Type something...";
        input.style.fontSize = "2rem";
        disable([...OPERATOR_BUTTONS, btnEq, btnBack, btnDot, btnPercent]);
    } else {

        if (buffer[buffer.length - 1] === "%") {
            disable([...NUMBER_BUTTONS, btnDot, btnPercent]);
        } else if (currentOperand().length === 0) {
            disable([btnPercent, btnDot]);
        }

        input.textContent = buffer + (currentOperand().length === 0 ? "" : parseFloat(currentOperand()).toLocaleString('en'));
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
    
    let res;
    try {
        res = expression.length === 0 ? NaN : Function(`'use strict'; return (${expression})`)();
    } catch(error) {
        if (error) {
            console.log("There is an error!");
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
    if (isNaN(parseFloat(token))) { // operators

        // expect an operand
        if (currentOperand().length === 0 && 
            buffer[buffer.length - 1] !== "%" &&
            token !== "/100"
        ) { 
            // operator replacement    
            buffer = buffer.substring(0, buffer.length - 1) + (view ?? token);
        } else {
            if (buffer.endsWith("%")) {
                buffer += (view ?? token)
            } else {
                buffer += parseFloat(currentOperand()).toLocaleString('en') + (view ?? token);
            }
            operandStack.push("");
        }
    } else { // numbers
        setCurrentOperand(currentOperand() + token);
    }

    expression += token;
    setInput();
    setOutput();
}

function parenthesize() {
    // TODO: parentheses
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
        if (currentOperand().length === 0) {
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

btnAC.addEventListener('click', () => reset());
btnEq.addEventListener('click', () => setOutput(true));
btnBack.addEventListener('click', () => backspace());