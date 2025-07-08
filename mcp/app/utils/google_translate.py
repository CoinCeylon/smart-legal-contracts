from google.cloud import translate_v2 as translate

def translate_text(text, target_language):
    '''Translates text into the target language.'''
    translate_client = translate.Client()

    result = translate_client.translate(text, target_language=target_language)

    return result['translatedText']

# if __name__ == '__main__':
#     text = '01) Hello, how are you?'
#     target_language = 'si'

#     translation = translate_text(text, target_language)

#     with open('translation.txt', 'w', encoding='utf-8') as f:
#         f.write(translation)

#     print(f'Translation: {translation}')