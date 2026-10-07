export default {
  rules: {
    'declaration-empty-line-before': 'never',
    'custom-property-empty-line-before': 'never',
    'rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
      },
    ],
  },
}