// "1 dia", "3 dias": a contagem já concordando com o substantivo.
export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
