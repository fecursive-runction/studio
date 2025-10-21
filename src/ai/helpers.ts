'use server';
import { Handlebars } from 'genkit/tools';

export function registerHelpers() {
  // Check if helpers are already registered to avoid errors on hot-reloads
  if (Handlebars.helpers.eq) return;

  Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
  });

  Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
  });
}
