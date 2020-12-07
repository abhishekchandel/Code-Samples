import { Directive, Input, ElementRef } from "@angular/core";

@Directive({
  selector: "[saUiValidate]"
})
export class UiValidateDirective {
  @Input() saUiValidate: any;

  constructor(private el: ElementRef) {
    Promise.all([
      import("jquery-validation/dist/jquery.validate.js"),
      import("jquery-validation/dist/additional-methods.js")
    ])
    .then(() => {
      $.validator.addMethod("dateGreaterThanOrEqual", function(value, element, params) {
        if (!/Invalid|NaN/.test(String(new Date(value)))) {
            return new Date(value) > new Date($(params).val());
        }

        return isNaN(value) && isNaN($(params).val()) || (Number(value) >= Number($(params).val())); 
      },'Must be greater than from Start Date.');

      //Custom Validator
      //^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}
      $.validator.addMethod('goodPassword', function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&#]{8,10}$/.test(value);
      }, 'Password should be a minimum of 8 characters long and contain one uppercase, one lowercase, one number, one special character.');

      this.attach();
    });
    
  }

  attach() {
    const $form = $(this.el.nativeElement);
    const validateCommonOptions = {
      rules: {},
      messages: {},
      errorElement: "em",
      errorClass: "invalid",
      highlight: (element, errorClass, validClass) => {
        $(element)
          .addClass(errorClass)
          .removeClass(validClass);
        $(element)
          .parent()
          .addClass("state-error")
          .removeClass("state-success");
      },
      unhighlight: (element, errorClass, validClass) => {
        $(element)
          .removeClass(errorClass)
          .addClass(validClass);
        $(element)
          .parent()
          .removeClass("state-error")
          .addClass("state-success");
      },

      errorPlacement: (error, element) => {
        if (element.parent(".input-group").length) {
          error.insertAfter(element.parent());
        } else {
          error.insertAfter(element);
        }
      }
    };

    $form
      .find("[data-smart-validate-input], [smart-validate-input]")
      .each(function() {
        var $input = $(this),
          fieldName = $input.attr("name");

        validateCommonOptions.rules[fieldName] = {};

        if ($input.data("required") != undefined) {
          validateCommonOptions.rules[fieldName].required = true;
        }
        if ($input.data("email") != undefined) {
          validateCommonOptions.rules[fieldName].email = true;
        }

        if ($input.data("maxlength") != undefined) {
          validateCommonOptions.rules[fieldName].maxlength = $input.data(
            "maxlength"
          );
        }

        if ($input.data("minlength") != undefined) {
          validateCommonOptions.rules[fieldName].minlength = $input.data(
            "minlength"
          );
        }

        if ($input.data("message")) {
          validateCommonOptions.messages[fieldName] = $input.data("message");
        } else {
          Object.keys($input.data()).forEach(key => {
            if (key.search(/message/) == 0) {
              if (!validateCommonOptions.messages[fieldName])
                validateCommonOptions.messages[fieldName] = {};

              var messageKey = key.toLowerCase().replace(/^message/, "");
              validateCommonOptions.messages[fieldName][
                messageKey
              ] = $input.data(key);
            }
          });
        }
      });

    $form.validate($.extend(validateCommonOptions, this.saUiValidate));
  }
}
