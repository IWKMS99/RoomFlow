package iwkms.roomflow.modules.booking.api.dto.validation;

import iwkms.roomflow.modules.booking.api.dto.CreateBookingRequestDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidBookingPeriodValidator implements ConstraintValidator<ValidBookingPeriod, CreateBookingRequestDto> {

    @Override
    public boolean isValid(CreateBookingRequestDto dto, ConstraintValidatorContext context) {
        if (dto.startTime() == null || dto.endTime() == null) {
            return true;
        }

        if (dto.startTime().isBefore(dto.endTime())) {
            return true;
        }

        context.disableDefaultConstraintViolation();

        context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                .addPropertyNode("endTime")
                .addConstraintViolation();

        return false;
    }
}
