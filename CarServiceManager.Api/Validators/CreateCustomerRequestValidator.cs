using FluentValidation;

namespace CarServiceManager.Api.Validators;

public class CreateCustomerRequestValidator : AbstractValidator<CreateCustomerRequest>
{
    public CreateCustomerRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Wymagane jest podanie imienia.")
            .MaximumLength(50).WithMessage("Imię nie może przekraczać 50 znaków.");


        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Wymagane jest podanie nazwiska.")
            .MaximumLength(50).WithMessage("Nazwisko nie może przekraczać 50 znaków.");

        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Wymagane jest podanie numeru telefonu.")
            .Matches(@"^\+?(\d{1,3})?[-.\s]?(\(?\d{1,4}\)?[-.\s]?){1,4}\d{1,9}$")
            .WithMessage("Nieprawidłowy format numeru telefonu.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Wymagane jest podanie adresu e-mail.")
            .EmailAddress().WithMessage("Nieprawidłowy format adresu e-mail.");
    }
}