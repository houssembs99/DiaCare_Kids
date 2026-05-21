using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Stripe;
using Stripe.Checkout;
using Microsoft.Extensions.Options;
using DiaCareKids.Api.Configuration;

namespace DiaCareKids.Api.Services
{
    public class StripeService
    {
        private readonly StripeSettings _stripeSettings;

        public StripeService(IOptions<StripeSettings> stripeSettings)
        {
            _stripeSettings = stripeSettings.Value;
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
        }

        public async Task<Session> CreateSubscriptionCheckoutSessionAsync(string userEmail, string planName, long priceAmount)
        {
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmount = priceAmount, // in cents (e.g. 5000 = 50.00)
                            Currency = "eur",
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = planName,
                            },
                            Recurring = new SessionLineItemPriceDataRecurringOptions
                            {
                                Interval = "month",
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "subscription",
                SuccessUrl = "http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}",
                CancelUrl = "http://localhost:3000/pricing",
                CustomerEmail = userEmail,
            };

            var service = new SessionService();
            return await service.CreateAsync(options);
        }

        public async Task<Invoice> SendInvoiceAsync(string userEmail, string description, long amount)
        {
            // 1. Create or get customer
            var customerService = new CustomerService();
            var searchOptions = new CustomerSearchOptions { Query = $"email:'{userEmail}'" };
            var searchResults = await customerService.SearchAsync(searchOptions);
            
            Customer customer;
            if (searchResults.Data.Count > 0)
            {
                customer = searchResults.Data[0];
            }
            else
            {
                var customerOptions = new CustomerCreateOptions { Email = userEmail };
                customer = await customerService.CreateAsync(customerOptions);
            }

            // 2. Create an invoice item
            var invoiceItemService = new InvoiceItemService();
            var invoiceItemOptions = new InvoiceItemCreateOptions
            {
                Customer = customer.Id,
                Amount = amount,
                Currency = "eur",
                Description = description,
            };
            await invoiceItemService.CreateAsync(invoiceItemOptions);

            // 3. Create the invoice
            var invoiceService = new InvoiceService();
            var invoiceOptions = new InvoiceCreateOptions
            {
                Customer = customer.Id,
                CollectionMethod = "send_invoice",
                DaysUntilDue = 30,
            };
            var invoice = await invoiceService.CreateAsync(invoiceOptions);

            // 4. Send the invoice
            return await invoiceService.SendInvoiceAsync(invoice.Id);
        }

        public async Task<PaymentIntent> CreatePaymentIntentAsync(long amount)
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = amount,
                Currency = "eur",
                PaymentMethodTypes = new List<string> { "card" },
            };

            var service = new PaymentIntentService();
            return await service.CreateAsync(options);
        }
    }
}
