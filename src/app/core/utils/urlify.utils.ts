const expression = /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)?/gi;
const regex = new RegExp(expression);

export const replaceURL = (text: string): string => {
  const str = text.split('://');
  if (str[1] && str[2]) {
    const str3 = str[1] + '://' + str[2];
    const retour = str3.replace(regex, '<a target="_blank" style="text-decoration: underline; color: blue" href="//$&">$&</a>');
    if (str[0].includes('https')) {
      return str[0].replace('https', '') + retour;
    } else if (str[0].includes('http')) {
      return str[0].replace('http', '') + retour;
    } else {
      return '';
    }
  } else if (str[1]) {
    const retour = str[1].replace(regex, '<a target="_blank" style="text-decoration: underline; color: blue" href="//$&">$&</a>');
    if (str[0].includes('https')) {
      return str[0].replace('https', '') + retour;
    } else if (str[0].includes('http')) {
      return str[0].replace('http', '') + retour;
    } else {
      return '';
    }
  } else {
    return text.replace(regex, '<a target="_blank" style="text-decoration: underline; color: blue" href="//$&">$&</a>');
  }
};
