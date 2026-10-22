using FluentValidation;

namespace CarServiceManager.Api.Validators;

public class CreateCarRequestValidator : AbstractValidator<CreateCarRequest>
{
    public CreateCarRequestValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Identyfikator właściciela jest wymagany.");

        RuleFor(x => x.Make)
            .NotEmpty().WithMessage("Marka samochodu nie może być pusta.")
            .MaximumLength(50).WithMessage("Marka nie może mieć więcej niż 50 znaków.");

        RuleFor(x => x.Model)
            .NotEmpty().WithMessage("Model samochodu nie może być pusty.")
            .MaximumLength(50).WithMessage("Model nie może mieć więcej niż 50 znaków.");

        RuleFor(x => x.Vin)
            .NotEmpty().WithMessage("Numer VIN jest wymagany.")
            .Length(17).WithMessage("Numer VIN musi mieć dokładnie 17 znaków.")
            .Matches("^[A-HJ-NPR-Z0-9]{17}$").WithMessage("VIN zawiera niedozwolone znaki (nie może zawierać liter I, O, Q).");

        RuleFor(x => x.Mileage)
            .GreaterThanOrEqualTo(0).WithMessage("Przebieg nie może być ujemny.");

        RuleFor(x => x.LicensePlate)
            .NotEmpty().WithMessage("Numer rejestracyjny jest wymagany.")
            .MaximumLength(10).WithMessage("Numer rejestracyjny nie może mieć więcej niż 10 znaków.");
    }
}