import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const createStripeAccount = async () => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'IT',
      email: 'rider@example.com', // This will be updated with actual email
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })
    return account
  } catch (error) {
    console.error('Error creating Stripe account:', error)
    throw error
  }
}

export const createAccountLink = async (accountId: string, returnUrl: string) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: returnUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    })
    return accountLink
  } catch (error) {
    console.error('Error creating account link:', error)
    throw error
  }
}

export const createPaymentIntent = async (
  amount: number,
  currency: string,
  applicationFeeAmount: number,
  destinationAccountId: string
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: destinationAccountId,
      },
    })
    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
} 