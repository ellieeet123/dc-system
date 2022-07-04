# misc funcs

import hashlib

PATH = __file__[:__file__.rfind('/')+1]

def sha256(string):
  return hashlib.sha256(string.encode('utf-8')).hexdigest()

def checkpw(username, pw):
  hash = sha256(pw)
  f = open(PATH + 'users.txt')
  user_list = f.read().split('\n')
  f.close()
  for x in user_list:
    line = x.split(',')
    if line[0] == username and line[1] == hash:
      return True
  return False

def checkusername(username):
  f = open(PATH + 'users.txt', 'r')
  contents = f.read()
  f.close()
  for i in contents.split('\n'):
    if i.split(',')[0] == username:
      return True
  return False

def get_session(name):
  contents = open(PATH + 'sessions.txt', 'r').read().split('\n')
  for i in contents:
    if i != '':
      line = i.split('>')
      if line[0] == name:
        return line[1]
  return ''
