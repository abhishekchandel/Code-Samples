import { Directive, ElementRef, HostListener, Input, HostBinding } from '@angular/core';
@Directive({
    selector: '[char-mask]'
})
export class CharDirective {
    @Input() upperCase = true;

    @HostBinding('class.upper')
    get upper() {
        return this.upperCase;
    }

    @HostListener('keydown', ['$event'])
    onKeydown(e) {
        if (!this.validateKeyCode(e.keyCode, e.target.value)) {
            e.preventDefault();
        }
    }

    private validateKeyCode(keyCode: number, value: string): boolean {
        var inp = String.fromCharCode(keyCode);
        if ((/[a-zA-Z]/.test(inp)) && (value.length <= 3)) {
            return true;
        }
        const whiteListedCodes = [8, 9, 13, 16, 37, 39];
        if (whiteListedCodes.indexOf(keyCode) > -1) {
            return true;
        }
    }
}