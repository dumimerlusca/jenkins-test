import { PaymentCard } from "../helpers/paymentMethodHelper";

export const AMEX: PaymentCard = {
  number: "378282246310005",
  exp: "11 / 36",
  cvc: "1234",
};

export const MASTERCARD: PaymentCard = {
  number: "5555555555554444",
  exp: "12 / 34",
  cvc: "123",
};
