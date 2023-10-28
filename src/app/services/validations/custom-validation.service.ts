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
    // Only Numbers 0-9
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
      (charCode < 97 || charCode > 122)//letras mayusculas
      && (charCode < 65 || charCode > 90) //letras minusculas
      && (charCode != 45) //retroceso
      && (charCode != 241) //ñ
      && (charCode != 209) //Ñ
      && (charCode != 32) //espacio
      && (charCode != 225) //á
      && (charCode != 233) //é
      && (charCode != 237) //í
      && (charCode != 243) //ó
      && (charCode != 250) //ú
      && (charCode != 193) //Á
      && (charCode != 201) //É
      && (charCode != 205) //Í
      && (charCode != 211) //Ó
      && (charCode != 218) //Ú
    ) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

}
