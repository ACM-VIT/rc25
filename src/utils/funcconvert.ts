export function pythonFunction(code: string, testcases: number, delimiter: string): string {
    const template = `def solve():
    # Original function code here
    return

if __name__ == "__main__":
    for _ in range(${testcases}):
        solve()
        print("${delimiter}", end="")`;

    return template.replace('# Original function code here', code);
}

export function cFunction(code: string, testcases: number, delimiter: string): string {
    const template = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <stdbool.h>
#include <limits.h>
#include <ctype.h>

int solve() {
    // Original function code here
    return 0;
}

int main() {
    int t = ${testcases};
    while(t--) {
        solve();
        printf("${delimiter}");
    }
    return 0;
}`;

    return template.replace('// Original function code here', code);
}

export function cppFunction(code: string, testcases: number, delimiter: string): string {
    const template = `#include <bits/stdc++.h>
using namespace std;

int solve() {
    // Original function code here
    return 0;
}

int main() {
    int t = ${testcases};
    while(t--) {
        solve();
        cout << "${delimiter}";
    }
    return 0;
}`;

    return template.replace('// Original function code here', code);
}

export function javaFunction(code: string, testcases: number, delimiter: string): string {
    const template = `import java.util.*;

public class Solution {
    public static int solve() {
        // Original function code here
        return 0;
    }
    
    public static void main(String[] args) {
        int t = ${testcases};
        while(t-- > 0) {
            solve();
            System.out.print("${delimiter}");
        }
    }
}`;

    return template.replace('// Original function code here', code);
}

export function jsFunction(code: string, testcases: number, delimiter: string): string {
    const template = `function solve() {
    // Original function code here
    return 0;
}

for(let i = 0; i < ${testcases}; i++) {
    solve();
    process.stdout.write("${delimiter}");
}`;

    return template.replace('// Original function code here', code);
}

export function goFunction(code: string, testcases: number, delimiter: string): string {
    const template = `package main

import (
    "bufio"
    "cmp"
    "fmt"
    "math"
    "os"
    "slices"
    "strconv"
    "time"
)

func solve() int {
    // Original function code here
    return 0
}

func main() {
    for i := 0; i < ${testcases}; i++ {
        solve()
        fmt.Print("${delimiter}")
    }
}`;

    return template.replace('// Original function code here', code);
}