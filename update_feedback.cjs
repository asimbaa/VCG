const fs = require('fs');
let content = fs.readFileSync('src/components/bank/UberEatsApp.tsx', 'utf8');

const targetStr = `                    ) : activeOrder.status === 'delivered' ? (
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-xl text-xs font-bold justify-center">
                        <ShieldCheck className="w-4 h-4 animate-bounce" /> Unilateral delivery handoff confirmed successfully.
                      </div>
                    ) : (`;

const newCode = `                    ) : activeOrder.status === 'delivered' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-xl text-xs font-bold justify-center">
                          <ShieldCheck className="w-4 h-4 animate-bounce" /> Unilateral delivery handoff confirmed successfully.
                        </div>
                        
                        {/* Rating and Feedback Form */}
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const fd = new FormData(form);
                          const rating = parseInt(fd.get("rating") as string);
                          const feedback = fd.get("feedback") as string;
                          try {
                            await addDoc(collection(db, "delivery_feedback"), {
                              orderId: activeOrder.id,
                              restaurantName: activeOrder.restaurantName,
                              rating,
                              feedback,
                              userId: user?.uid,
                              timestamp: new Date().toISOString()
                            });
                            toast.success("Feedback submitted!");
                            form.reset();
                            form.style.display = "none";
                            // Show a thank you message
                            const msg = document.createElement("div");
                            msg.className = "text-center text-emerald-600 font-bold text-xs p-3 bg-emerald-50 rounded-xl";
                            msg.innerText = "Thank you for your feedback!";
                            form.parentNode?.appendChild(msg);
                          } catch (err) {
                            console.error(err);
                            toast.error("Failed to submit feedback.");
                          }
                        }} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                           <h4 className="font-black text-slate-800 text-sm">Rate Your Delivery</h4>
                           <div className="flex items-center gap-2">
                             {[1, 2, 3, 4, 5].map((star) => (
                               <label key={star} className="cursor-pointer">
                                 <input type="radio" name="rating" value={star} className="peer sr-only" required />
                                 <Star className="w-6 h-6 text-slate-300 peer-checked:text-amber-400 peer-checked:fill-amber-400 hover:text-amber-300 transition-colors" />
                               </label>
                             ))}
                           </div>
                           <textarea 
                             name="feedback"
                             rows={2} 
                             required
                             placeholder="How was your order? (e.g. fast delivery, food was hot)" 
                             className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-[#06C167] focus:outline-none resize-none font-sans"
                           />
                           <button type="submit" className="w-full bg-slate-900 text-white font-heavy uppercase tracking-widest text-xs py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
                             Submit Feedback
                           </button>
                        </form>
                      </div>
                    ) : (`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newCode);
  fs.writeFileSync('src/components/bank/UberEatsApp.tsx', content);
  console.log("Feedback added successfully");
} else {
  console.log("Target not found");
}
