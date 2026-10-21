class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size()!=t.size()){
            return false;
        }
        unordered_map<char,int> mpp;// charachter and its count
        for (char c:s){
            mpp[c]++;
        }
        for (char c:t){
            mpp[c]--;
        }
        for (auto p:mpp){
            if (p.second!=0){
                return false;
            }
        }
        return true;
        
    }
};
// use a map to store char and count and thenadd for one and minus for another
//check if all 0
//TC: \(O(n)\) average — you traverse each string and the map once.
//SC: \(O(k)\) — the map stores up to \(k\) distinct characters.