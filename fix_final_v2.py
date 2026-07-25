import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# Replace the incorrect form and div closings we just added
content = content.replace(
"""                    </button>
                  )
                } 
              </form>
            </div>
          </div>
        )
      }""",
"""                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      )}"""
)

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)
