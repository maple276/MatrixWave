import random
import string

unique_strings = ["ABC.com", "AABCDADD.com", "EEIASDF.cn", "ASDF.com", "WWDADA.org", "ASDADADA.com", "OODAO.com.cn", "ASDSADDDDD.com.org", "asdafa.123", "qwqwqwqqwq", "asdfadfind", "didndidns", "ddd"]


def generate_random_sequences(number=5, number2=10):
    data = []
    for _ in range(number2):
        seqlen = random.randint(4, number)
        sequence = [random.choice(unique_strings) for _ in range(seqlen)]
        data.append(sequence)

    return data

random.seed()
result = generate_random_sequences(7, 100)

with open("./data/click6.json", "w") as file:
    outstr = '[\n\t'
    for i in range(len(result)):
        for c in str(result[i]):
            if c=='\'':
                outstr += '\"'
            else:
                outstr += c
        if i != len(result)-1:
            outstr += ',\n\t'
    outstr += '\n]'
    file.write(outstr)
