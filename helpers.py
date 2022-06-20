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

def session_exists(name):
  f = open(PATH + 'sessions.txt')
  contents = f.read()
