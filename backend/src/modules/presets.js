/**
 * Preset Buggy C++ Code Examples
 * Provides quick one-click benchmark cases representing classic logical errors.
 */

export const PRESET_EXAMPLES = [
  {
    id: 'binary-search-off-by-one',
    title: 'Binary Search (Off-by-One & Overflow Bug)',
    category: 'Off-by-One & Integer Overflow',
    problemStatement: 'Search for target integer in a sorted array of N elements. Output the 0-based index if found, or -1 if not found.',
    sourceCode: `#include <iostream>
#include <vector>

using namespace std;

// Buggy Binary Search:
// 1. mid = (l + r) / 2 can overflow for large indices.
// 2. r = mid causes an infinite loop when target is not found in right partition.
int binarySearch(const vector<int>& arr, int target) {
    int l = 0;
    int r = arr.size(); // Bug: should be arr.size() - 1 or while (l < r)

    while (l <= r) {
        int mid = (l + r) / 2; // Potential integer overflow
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            l = mid + 1;
        } else {
            r = mid; // Bug: leads to infinite loop if target is smaller
        }
    }
    return -1;
}

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    cout << binarySearch(arr, target) << endl;
    return 0;
}
`,
    testCases: [
      {
        id: 'tc-1',
        name: 'Target Present in Middle',
        input: '5 7\n1 3 5 7 9',
        expectedOutput: '3'
      },
      {
        id: 'tc-2',
        name: 'Target Smaller Than Left (Edge Case)',
        input: '5 0\n1 3 5 7 9',
        expectedOutput: '-1'
      },
      {
        id: 'tc-3',
        name: 'Single Element Not Found',
        input: '1 4\n5',
        expectedOutput: '-1'
      }
    ]
  },
  {
    id: 'kadane-negative-subarray',
    title: "Kadane's Algorithm (All-Negative Array Bug)",
    category: 'State Initialization & Edge Case',
    problemStatement: 'Find the maximum sum of a contiguous non-empty subarray. The array can contain negative integers.',
    sourceCode: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Buggy Kadane's:
// Initializes max_so_far = 0, which fails when all numbers are negative!
// Should initialize max_so_far = arr[0].
int maxSubarraySum(const vector<int>& arr) {
    int max_so_far = 0; // Bug: fails for negative numbers
    int curr_max = 0;

    for (size_t i = 0; i < arr.size(); i++) {
        curr_max += arr[i];
        if (curr_max < 0) {
            curr_max = 0;
        }
        if (curr_max > max_so_far) {
            max_so_far = curr_max;
        }
    }
    return max_so_far;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    cout << maxSubarraySum(arr) << endl;
    return 0;
}
`,
    testCases: [
      {
        id: 'tc-1',
        name: 'Mixed Positive and Negative',
        input: '5\n-2 1 -3 4 -1',
        expectedOutput: '4'
      },
      {
        id: 'tc-2',
        name: 'All Negative Numbers (Fails if max_so_far=0)',
        input: '3\n-5 -2 -8',
        expectedOutput: '-2'
      }
    ]
  },
  {
    id: 'two-sum-self-pairing',
    title: 'Two Sum (Hash Map Self-Pairing Bug)',
    category: 'State Tracking & Logic Error',
    problemStatement: 'Given an array of integers and a target sum, output the 0-based indices of the two numbers that add up to target. If no pair exists, output "-1 -1".',
    sourceCode: `#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

// Bug: Inserts element into map before checking complement!
// If target = 6 and arr[i] = 3, target - 3 = 3 matches the same element!
void findTwoSum(const vector<int>& arr, int target) {
    unordered_map<int, int> seen;
    
    // First inserts everything
    for (int i = 0; i < (int)arr.size(); i++) {
        seen[arr[i]] = i;
    }

    for (int i = 0; i < (int)arr.size(); i++) {
        int complement = target - arr[i];
        if (seen.find(complement) != seen.end()) {
            // Bug: Does not verify seen[complement] != i
            cout << i << " " << seen[complement] << endl;
            return;
        }
    }
    cout << "-1 -1" << endl;
}

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    findTwoSum(arr, target);
    return 0;
}
`,
    testCases: [
      {
        id: 'tc-1',
        name: 'Standard Two Sum Pair',
        input: '4 9\n2 7 11 15',
        expectedOutput: '0 1'
      },
      {
        id: 'tc-2',
        name: 'Self Element Re-use Bug (Target is 2*element)',
        input: '3 6\n3 1 2',
        expectedOutput: '-1 -1'
      }
    ]
  }
];
