class Solution:
    def isPalindrome(self, x: int) -> bool:
        y = str(x)
        for i in range(len(y)//2):
            if y[i] != y[len(y) - 1 -i]:
                return False
        return True