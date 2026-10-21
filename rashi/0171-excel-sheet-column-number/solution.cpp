class Solution {
public:
    int titleToNumber(string columnTitle) {
        int n=columnTitle.size()-1;
        int c=1;
        int ans=0;
        for (int i=0;i<columnTitle.size();i++){
            int chr = columnTitle[i]-'A'+1;// not 'a' its all uppercase
            ans = chr*pow(26,n) +ans;// dont forget to +ans
            n=n-1;
        }
        return ans;

        
    }
};
// single - 1-26 :char-a +1 
// AA - 2 digit first is A that means (1*26 ) + second letter A
// so its like a chain rule?
// 701 : (26*26)
// AAB = (1*26*26)+2 - so num of 26 = size-1