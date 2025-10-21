'use server';
import { Handlebars } from 'genkit/tools';

export function registerHelpers() {
  Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
  });

  Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
  });
}
