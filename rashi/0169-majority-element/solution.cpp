class Solution {
public:
    int majorityElement(vector<int>& nums) {
        unordered_map<int,int>mpp;
        for (int i=0;i<nums.size();i++){
            mpp[nums[i]]++;
        }
        int max1=0;
        int val=0;
        for (auto m:mpp){
            if (m.second>max1){
                max1=m.second;
                val=m.first;
            }
        }
        return val;
        
    }
};
// get quantity of all using for loop no need to check using find all just directly then use
// auto to go through and first and last for map