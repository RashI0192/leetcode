class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_map<int,int>st;
        for (int i=0;i<nums.size();i++){
            st[nums[i]]++;//no need to check if exist or not
            if (st[nums[i]] >=2){
                return true;
            }
            
        }
        return false;
    }
};
// map to check if count exceeds 2 , if want to use 1 then use set for less memory
// TC: O(n) — loop through nums once; hash map operations are O(1) average.
// SC: O(n) — hash map can store up to n distinct numbers.