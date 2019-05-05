def parse_string_bid(text):
  text = text.lower()
  text = re.sub(r'\W','',text)
  originaltext = text

  final = ''
  result = []
  
  def test_word(text):
    text1 = text
    for i in range(len(text1),2,-1):  
        test = text1[:i]
        if test in english:
          result.append(test)
          text0 = text1[i:].strip()
          test_word(text0)
          break
  
  def test_tail(tail):
    for i in range(3,len(tail)):
      test2 = tail[i:]
      if test2 in english:
        result.append(test2)
        tail0 = tail[:i]
        test_tail(tail0)
        break

  def rejoin(originaltext, result):      
    begin, end = 0,0
    final = ''
    for r in result:
      begin = originaltext.index(r)
      final += originaltext[end:begin]+' '
      end = originaltext.index(r)+len(r)
      final += originaltext[begin:end]+' '
    final += originaltext[end:]
    final = re.sub(r'\s+',' ',final).strip()
    return final

  test_word(text)
  if result:
    lastone = originaltext.index(result[-1])+len(result[-1])
    tail = originaltext[lastone:]
  else:
    tail = originaltext

  test_tail(tail)

  final = rejoin(originaltext, result)
  
  return final

text = 'sanvt11canada'
parse_string_bid(text)
