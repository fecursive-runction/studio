'use server';
import { Handlebars } from 'genkit/tools';

let helpersRegistered = false;

function registerHelpers() {
  if (helpersRegistered) return;

  Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
  });

  Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
  });

  helpersRegistered = true;
}

registerHelpers();
