import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CustomValidationService {

  constructor() { }

  patternValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const regex = new RegExp('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\[\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$');
      const valid = regex.test(control.value);
      return valid ? null : { invalidEmail: true };
    };
  }

  keyPressNumbers(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode;
    
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  keyPressLetters(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (
      (charCode < 97 || charCode > 122)
      && (charCode < 65 || charCode > 90) 
      && (charCode != 45) 
      && (charCode != 241) 
      && (charCode != 209) 
      && (charCode != 32) 
      && (charCode != 225) 
      && (charCode != 233) 
      && (charCode != 237) 
      && (charCode != 243) 
      && (charCode != 250) 
      && (charCode != 193) 
      && (charCode != 201) 
      && (charCode != 205) 
      && (charCode != 211) 
      && (charCode != 218) 
    ) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

}
