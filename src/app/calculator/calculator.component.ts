import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements OnInit {
  @ViewChild('calculatorModal') calculatorModal!: ElementRef;
  isShown = false;
  display = '0';
  currentValue = '0';
  previousValue = '0';
  operation: string | null = null;
  waitingForOperand = false;
  memory = '0';
  history: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  toggleCalculator(): void {
    this.isShown = !this.isShown;
    if (this.isShown) {
      setTimeout(() => {
        document.addEventListener('click', this.onDocumentClick);
      }, 100);
    } else {
      document.removeEventListener('click', this.onDocumentClick);
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();
  }

  onDocumentClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const calculatorElement = this.calculatorModal.nativeElement;
    const calculatorButton = document.querySelector('.calculator-toggle-btn');
    
    if (!calculatorElement.contains(target) && target !== calculatorButton && !calculatorButton?.contains(target)) {
      this.isShown = false;
      document.removeEventListener('click', this.onDocumentClick);
    }
  }

  inputDigit(digit: string): void {
    if (this.waitingForOperand) {
      this.currentValue = digit;
      this.waitingForOperand = false;
    } else {
      this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
    }
    this.updateDisplay();
  }

  inputDecimal(): void {
    if (this.waitingForOperand) {
      this.currentValue = '0.';
      this.waitingForOperand = false;
    } else if (this.currentValue.indexOf('.') === -1) {
      this.currentValue += '.';
    }
    this.updateDisplay();
  }

  clearAll(): void {
    this.currentValue = '0';
    this.previousValue = '0';
    this.operation = null;
    this.waitingForOperand = false;
    this.updateDisplay();
  }

  clearEntry(): void {
    this.currentValue = '0';
    this.updateDisplay();
  }

  handleOperator(nextOperator: string): void {
    const inputValue = parseFloat(this.currentValue);
    
    if (this.operation && !this.waitingForOperand) {
      const currentValueNum = parseFloat(this.currentValue);
      const previousValueNum = parseFloat(this.previousValue);
      
      const computeHistory = `${this.previousValue} ${this.operation} ${this.currentValue}`;
      
      let newValue;
      switch (this.operation) {
        case '+':
          newValue = previousValueNum + currentValueNum;
          break;
        case '-':
          newValue = previousValueNum - currentValueNum;
          break;
        case '*':
          newValue = previousValueNum * currentValueNum;
          break;
        case '/':
          newValue = previousValueNum / currentValueNum;
          break;
        default:
          newValue = currentValueNum;
      }
      
      this.currentValue = `${Number.isInteger(newValue) ? newValue : parseFloat(newValue.toFixed(10))}`;
      this.previousValue = this.currentValue;
      
      // Add to history
      this.history.unshift(`${computeHistory} = ${this.currentValue}`);
      if (this.history.length > 5) {
        this.history.pop();
      }
    } else {
      this.previousValue = this.currentValue;
    }

    this.waitingForOperand = true;
    this.operation = nextOperator;
    this.updateDisplay();
  }

  calculateResult(): void {
    if (!this.operation || this.waitingForOperand) {
      return;
    }

    const inputValue = parseFloat(this.currentValue);
    const previousValue = parseFloat(this.previousValue);
    
    const computeHistory = `${this.previousValue} ${this.operation} ${this.currentValue}`;
    
    let newValue;
    switch (this.operation) {
      case '+':
        newValue = previousValue + inputValue;
        break;
      case '-':
        newValue = previousValue - inputValue;
        break;
      case '*':
        newValue = previousValue * inputValue;
        break;
      case '/':
        newValue = previousValue / inputValue;
        break;
      default:
        newValue = inputValue;
    }
    
    this.currentValue = `${Number.isInteger(newValue) ? newValue : parseFloat(newValue.toFixed(10))}`;
    this.previousValue = this.currentValue;
    this.operation = null;
    this.waitingForOperand = true;
    
    // Add to history
    this.history.unshift(`${computeHistory} = ${this.currentValue}`);
    if (this.history.length > 5) {
      this.history.pop();
    }
    
    this.updateDisplay();
  }

  percent(): void {
    const currentValueNum = parseFloat(this.currentValue);
    const previousValueNum = parseFloat(this.previousValue);
    
    if (this.operation === '+' || this.operation === '-') {
      // For addition and subtraction, calculate the percentage of the first number
      const percentValue = previousValueNum * (currentValueNum / 100);
      this.currentValue = percentValue.toString();
    } else {
      // For others, just convert to percentage
      this.currentValue = (currentValueNum / 100).toString();
    }
    
    this.updateDisplay();
  }

  negate(): void {
    this.currentValue = (parseFloat(this.currentValue) * -1).toString();
    this.updateDisplay();
  }

  memoryAdd(): void {
    this.memory = (parseFloat(this.memory) + parseFloat(this.currentValue)).toString();
  }

  memorySubtract(): void {
    this.memory = (parseFloat(this.memory) - parseFloat(this.currentValue)).toString();
  }

  memoryRecall(): void {
    this.currentValue = this.memory;
    this.waitingForOperand = false;
    this.updateDisplay();
  }

  memoryClear(): void {
    this.memory = '0';
  }

  squareRoot(): void {
    const value = Math.sqrt(parseFloat(this.currentValue));
    this.currentValue = value.toString();
    this.waitingForOperand = true;
    this.updateDisplay();
  }

  square(): void {
    const value = Math.pow(parseFloat(this.currentValue), 2);
    this.currentValue = value.toString();
    this.waitingForOperand = true;
    this.updateDisplay();
  }

  updateDisplay(): void {
    this.display = this.currentValue;
  }
}