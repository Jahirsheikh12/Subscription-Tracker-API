import dayjs from "dayjs";

import { createRequire } from "module";
const require = createRequire(import.meta.url)
const { serve } = require('@upstash/workflow/express')
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";


const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {

    // get the subscription id from the request payload
    const { subscriptionId } = context.requestPayload;

    // fetching the subscription
    const subscription = await fetchSubscription(context, subscriptionId);

    //checking if subscription exists or not 
    if (!subscription || subscription.status !== 'active') return;

    // calculating the renewal date
    const renewalDate = dayjs(subscription.renewalDate)

    // checking if the renewal date is before from today or not
    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow`)
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');

        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
        }

        // check if today is the reminder date
        // if (dayjs().isSame(reminderDate, 'day')) {
        //     await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
        // }

        await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
    }
})


const fetchSubscription = async (context, subscriptionId) => {
    // starting the context for getting the subscription
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    })
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate())
}

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label}`);
        // send email, SMS, push notification, etc

        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription,
        })

    })
}